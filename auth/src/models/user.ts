import mongoose from "mongoose";
import { Password } from '../utils/password'

// Describes properties required to create a new User
interface UserAttrs {
    email: string;
    password: string
}

// Describes properties a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

// Describes properties a User Document has
interface UserDoc extends mongoose.Document {
    email: string;
    password: string
}

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        }
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.password;
                delete ret.__v;
            }
        }
    }
);

// Middleware to be executed when the document is saved
// 'this' inside of a pre-save hook refers to the document that is about to be saved
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const hashed = await Password.hash(this.get('password'));
        this.set('password', hashed);
    }
    next();
});

// Assign a static function "build" to the userSchema
// which adds a UserAttrs type to the collection
userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };