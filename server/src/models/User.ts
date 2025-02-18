import { Schema, model, Document } from 'mongoose';


//Interface for the user
export interface IUser extends Document {
  email: string;
  password: string;
  isAdmin: boolean; 
}


//User schema
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: { type: Boolean, default: false }, //Not implemented but stays active
});

export default model<IUser>('User', userSchema);