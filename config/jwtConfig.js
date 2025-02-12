require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || '9b6837dc70533b1f97cf40f5809f3e8c169182c11c7e6dda2dadf93106e418c6df7f79de6907406fd796933a836997a985df2f086695eac2966a49797a29e7c6',
};
