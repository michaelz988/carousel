exports.shuffleOnce = (items) => {
    for (let i = items.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i+1));
      let temp = items[i];
      items[i] = items[j];
      items[j] = temp;
    }
};
