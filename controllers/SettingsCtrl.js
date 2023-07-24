const Settings = require("../models/Settings");

const getSettings = async (req, res) => {
  try {
    const GoalUsers = await Settings.find();
    res.status(200).json({ data: GoalUsers });  
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.getSettings = getSettings;

const createSetting = async (req, res) => {
  try {
    const { name, logo, adBanner, aboutUs, phoneNumber, phoneNumber2, email } =
      req.body;
    await new Settings({
      name,
      logo,
      adBanner,
      aboutUs,
      phoneNumber,
      phoneNumber2,
      email,
    }).save();
    const settings = await Settings.find({});
    res.json({ settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
module.exports.createSetting = createSetting;

const updateSetting = async (req, res) => {
  try {
    const {
      id,
      name,
      logo,
      adBanner,
      aboutUs,
      phoneNumber,
      phoneNumber2,
      email,
    } = req.body;

    await Settings.findByIdAndUpdate(id, {
      name,
      logo,
      adBanner,
      aboutUs,
      phoneNumber,
      phoneNumber2,
      email,
    });

    const settings = await Settings.find({});
    res.json({ settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
module.exports.updateSetting = updateSetting;