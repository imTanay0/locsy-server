import Address from "../models/AddressModel.js";
import Buyer from "../models/BuyerModel.js";
import User from "../models/UserModel.js";

export const addAddress = async (req, res) => {
  const { street, city, state, zipCode, contactNo } = req.body;

  if (!street || !city || !state || !zipCode || !contactNo) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all the required fields",
    });
  }

  try {
    const buyer = await Buyer.findOne({ userId: req.user._id });
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const newAddress = await Address.create({
      street,
      city,
      state,
      zipCode,
    });
    if (!newAddress) {
      return res.status(500).json({
        success: false,
        message: "Failed to create address",
      });
    }

    buyer.addresses.push({ addressId: newAddress._id, contactNo: contactNo });
    await buyer.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
      contactNo,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeAddress = async (req, res) => {
  const { addressId } = req.params;
  if (!addressId) {
    return res.status(400).json({
      success: false,
      message: "Address ID is required",
    });
  }
  try {
    const buyer = await Buyer.findOne({ userId: req.user._id });
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const address = await Address.findByIdAndDelete(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    buyer.addresses = buyer.addresses.filter(
      (address) => address.addressId.toString() !== addressId
    );
    await buyer.save();

    res
      .status(200)
      .json({ success: true, message: "Address removed successfully", buyer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAddressForBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.findOne({ userId: req.user._id });
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const addresses = await Address.find({
      _id: { $in: buyer.addresses.map((address) => address.addressId) },
    });

    const contactNo = buyer.addresses.map((address) => address.contactNo);

    res.status(200).json({ success: true, addresses, contactNo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
