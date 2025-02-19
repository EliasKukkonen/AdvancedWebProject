
import { timeStamp } from "console";
import { Schema, model, Document, Types } from "mongoose";

//Interface for a comment 
export interface IComment {
  _id?: Types.ObjectId;
  text: string;
  createdAt?: string;  
  updatedAt?: string;  
}

//Interface for a card
export interface ICard {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  color?: string;
  createdAt?: string;  
  updatedAt?: string;  
  comments?: IComment[];
  estimatedCompletion?: Date | null;
}

//Interface for column

 export interface IColumn {
  _id?: Types.ObjectId;
  title: string;
  cards: ICard[];
}


//Interface for board

export interface IBoard extends Document {
  owner: Types.ObjectId; // User ID (from token)
  title: string;
  columns: IColumn[];
  createdAt?: Date;
  updatedAt?: Date;
}


//Schema for comments
const commentSchema = new Schema<IComment>(
  {
    text: { type: String, required: true },
    // createdAt is automatically set via timestamps
  
    
  },
  { _id: true,
    timestamps: true,
   } 
);


//Card schema
const cardSchema = new Schema<ICard>(
  {
    title: { type: String, required: true },
    description: { type: String },
    color: { type: String, default: "#ffffff" },
    comments: {type: [commentSchema], default:[]},
    estimatedCompletion: { type: Date, default: null },
  },
  { _id: true,
    timestamps: true
   }, // Timestamps created automatically
  
);


//Column schema
const columnSchema = new Schema<IColumn>(
  {
    title: { type: String, required: true },
    cards: { type: [cardSchema], default: [] },
  },
  { _id: true } 
);

//Schema for boards.
const boardSchema = new Schema<IBoard>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, default: "My Board" },
    columns: { type: [columnSchema], default: [] },
  },
  {
    timestamps: true, //  Track when board is created
  }
);

export default model<IBoard>("Board", boardSchema);