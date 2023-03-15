const models = require('../models');
async function createCategory() {
  const category = models.Category.build({ name: 'test1' });
  await category.save();
}
createCategory();