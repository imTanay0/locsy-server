import mongoose from "mongoose";

const PaymentInformationSchema = new mongoose.Schema({});


export default mongoose.model("PaymentInformation", PaymentInformationSchema);