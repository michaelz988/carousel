const multer = require("multer");
const readline = require('readline');
const { Readable } = require('stream');
const addrs = require("email-addresses");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");

const db = require("@carousel/core");
const User = db.user;
const Role = db.role;
const UserAssignment = db.user_assignments;

const s3 = new S3Client({});
const UPLOAD_BUCKET = process.env.UPLOAD_BUCKET;

// Use multer memory storage (no disk in Lambda)
const storage = multer.memoryStorage();
const uploadFile = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("file");

const upload = async (req, res) => {
  const assignmentId = parseInt(req.query.assignment);
  const classPeriod = parseInt(req.query.period);

  try {
    await new Promise((resolve, reject) => {
      uploadFile(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    // Upload to S3
    const key = `uploads/${Date.now()}-${req.file.originalname}`;
    await s3.send(new PutObjectCommand({
      Bucket: UPLOAD_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    // Process the file content from memory buffer
    const teacherAssignment = await UserAssignment.findOne({ where: {
      assignmentId: assignmentId,
      teacherId: req.userId
    }});

    const readInterface = readline.createInterface({
      input: Readable.from(req.file.buffer),
      output: null,
      console: false
    });

    readInterface.on('line', function(line) {
      const email = addrs.parseOneAddress(line);
      if (!email) return;
      console.log("Name: ", email.name, "Address: ", email.address, "Local: ", email.local);
      User.findOrCreate({
        where: { email: email.address },
        defaults: {
          username: email.local,
          email: email.address
        }
      })
        .then(([user, created]) => {
          console.log("Setting role for student");
          user.setRoles([3]);
          user.setAssigned(assignmentId).then(async studentAssignments => {
            const studentAssignment = studentAssignments[0][0];
            await studentAssignment.setClassTeacher(teacherAssignment.id);
            studentAssignment.period = classPeriod;
            studentAssignment.save();
          }).catch(err => {
            console.log("Error setting student assignment");
          });
        })
        .catch(err => {
          console.log("Error in processing email address");
        });
    });

    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (err) {
    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${req.file ? req.file.originalname : 'unknown'}. ${err}`,
    });
  }
};

module.exports = {
  upload
};
