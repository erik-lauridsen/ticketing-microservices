import { OrderStatus } from "@elauridsen_tickets/common";
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface OrderAttrs {
  id: string;
  version: number;
  price: number;
  status: OrderStatus;
  userId: string;
}

interface OrderDoc extends mongoose.Document {
  version: number;
  price: number;
  status: OrderStatus;
  userId: string;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
  findByEvent(event: {id: string, version: number}): Promise<OrderDoc> | null;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created
    },
    version: {
      type: mongoose.Schema.Types.Number
    },
    price: {
      type: mongoose.Schema.Types.Number,
      ref: 'Ticket'
    }
  },
  {
    toJSON: {
      transform(doc, ret) {
        //@ts-ignore
        ret.id = ret._id;
        //@ts-ignore
        delete ret._id;
      }
    }
  }
);

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    status: attrs.status,
    userId: attrs.userId
  });
};

orderSchema.statics.findByEvent = (event: {id: string, version: number}) => {
  return Order.findOne({
      _id: event.id,
      version: event.version - 1
    });
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };