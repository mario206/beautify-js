let r = async function (e) {
  return await new Promise(r => {
    return false;
  });
};

module.exports = {
  copy: async function (i, a) {
    if (!(await r(i))) {
      return;
    }

    return a;
  }
};