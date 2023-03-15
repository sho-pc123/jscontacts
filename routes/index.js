const express = require('express');
const router = express.Router();
const models = require('../models');
const { ValidationError } = require('sequelize');

/* GET home page. */
router.get('/', async function(req, res, next) {
  req.session.view_counter = (req.session.view_counter || 0) + 1; //--- [1]
  const flashMessage = req.session.flashMessage; //--- [2]
  delete req.session.flashMessage; //--- [3]

  const now = new Date();
  const contacts = await models.Contact.findAll({include:'category'});
  const categories = await models.Category.findAll(); //--- [2]
  res.render('index', {
    title: '連絡帳', now, contacts, categories, view_counter: req.session.view_counter, flashMessage }); //--- [4]
});

router.get('/about', function(req, res, next) {
  res.render('about', {title: 'About'});
});

router.get('/contact_form', async function (req, res, next) {
  const categories = await models.Category.findAll();
  res.render('contact_form', { title: '連絡先の作成', contact: {}, categories });
});

router.get('/contacts/:id/edit', async function (req, res, next) {
  const contact = await models.Contact.findByPk(req.params.id);
  const categories = await models.Category.findAll();
  res.render('contact_form', { title: '連絡先の更新', contact: contact, categories });
});

router.post('/contacts', async function (req, res, next) {
  const fields = ['name', 'email', 'categoryId']; //---[1]
  try {
    console.log('posted', req.body);
    if (req.body.id) {
      const contact = await models.Contact.findByPk(req.body.id); //---[1]
      contact.set(req.body);
      await contact.save({ fields });
      req.session.flashMessage = `「${contact.name}」さんを更新しました`; //--- [4]
    } else {
      const contact = models.Contact.build(req.body);
      await contact.save({ fields });
      req.session.flashMessage = `新しい連絡先として「${contact.name}」さんを保存しました`; //--- [1]
    }
    res.redirect('/');
  } catch (err) {
    if (err instanceof ValidationError) {
      const title = (req.body.id) ? '連絡先の更新' : '連絡先の作成'; //--- [5〜]
      res.render(`contact_form`, { title, contact: req.body, err: err }); //--- [〜5]
    } else {
      throw err; // ここでの対応を諦めて処理系に任せる
    }
  }
});

router.post('/contacts/:id/delete', async function (req, res, next) { //--- [1]
  console.log(req.params); //--- [2]
  const contact = await models.Contact.findByPk(req.params.id); //---[3]
  await contact.destroy(); //--- [4]
  req.session.flashMessage = `「${contact.name}」さんを削除しました`;
  res.redirect('/');
});

//カテゴリー

// router.get('/category_form', async function (req, res, next) {
//   const categories = await models.Category.findAll();
//   res.render('category_form', { title: 'カテゴリの作成', contact: {} });
// });

router.get('/categories/:id', async function (req, res, next) {
  const category = await models.Category.findByPk(req.params.id);
  const contacts = await category.getContacts({ include: 'category' });
  res.render('category', { title: `カテゴリ ${category.name}`, category, contacts });
});

// router.post('/categories', async function (req, res, next) {
//   try{
//   console.log('posted', req.body);
//   const category = models.Category.build({ name: req.body.name });
//   await category.save();
//   res.redirect('/');
//   } catch (err) {
//     if (err instanceof ValidationError) {
//       res.render(`category_form`, { title: 'カテゴリの作成', category: req.body, err: err });
//     } else {
//       throw err; // ここでの対応を諦めて処理系に任せる
//     }
//   }
// });


router.post('/categories/:id/delete', async function (req, res, next) { //--- [1]
  console.log(req.params); //--- [2]
  const category = await models.Category.findByPk(req.params.id); //---[3]
  await category.destroy(); //--- [4]
  req.session.flashMessage = `「${category.name}」を削除しました`;
  res.redirect('/');
});


module.exports = router;