// // const mongoose = require("mongoose")

// // const GallerySchema = new mongoose.Schema({
// //     clientName: {
// //         type: String,
// //         required: true,
// //         trim: true
// //     },
// //     clientEmail: {
// //         type: String,
// //         required: true,
// //         trim: true
// //     },
// //     clientPassword: {
// //         type: String,
// //         required: true // הסיסמה הייחודית שהלקוחה תקבל ותזין בכניסה
// //     },
// //     images: [
// //         {
// //             imageUrl: { 
// //                 type: String, 
// //                 required: true 
// //             }, // הנתיב או הכתובת של התמונה בשרת
// //             imageName: {
// //                  type: String, 
// //                  required: true 
// //             }, // שם קובץ התמונה
// //             watermarked: { 
// //                 type: Boolean, 
// //                 default: false 
// //             }, // האם נוספה חותמת מים
// //             isSelected: {
// //                  type: Boolean, 
// //                  default: false
// //             },  // האם הלקוחה בחרה את התמונה הזו
// //             selectionOrder: { 
// //                 type: Number, 
// //                 default: null 
// //             }, // המספר הסידורי שבו נבחרה (למשל 1, 2, 3...)
// //             colorCode: { 
// //                 type: String, 
// //                 default: null 
// //             }      // הצבע שבו התמונה צבועה לפי חוקי הבחירה שלך
// //         }
// //     ],
// //     date: {
// //         type: Date,
// //         default: Date.now // תאריך יצירת הגלריה (ניתן לשנות לפי הצורך)
// //     },
// //     maxSelections: {
// //         type: Number,
// //         default: 10 // מספר התמונות ברירת מחדל  שהלקוחה רשאית לבחור (ניתן לשנות ברירת מחדל)
// //     },
// //     rawPhotosLink: {
// //         type: String,
// //         default: ""
// //     },
// //     editedPhotosLink: {
// //         type: String,
// //         default: ""
// //     },
// //     isSubmitted: {
// //         type: Boolean,
// //         default: false // האם הלקוחה סיימה את הבחירה ושלחה אותה חזרה אליך
// //     }
// // }, { 
// //     timestamps: true 
// // })

// // module.exports = mongoose.model('gallery', GallerySchema)






















// const mongoose = require("mongoose");

// const ImageSchema = new mongoose.Schema(
//     {
//         imageUrl: {
//             type: String,
//             required: true
//         },

//         imageName: {
//             type: String,
//             required: true
//         },

//         watermarked: {
//             type: Boolean,
//             default: false
//         },

//         // האם הצלמת החליטה לשלוח את התמונה ללקוחה
//         photographerSelected: {
//             type: Boolean,
//             default: false
//         },

//         // האם הלקוחה בחרה את התמונה
//         clientSelected: {
//             type: Boolean,
//             default: false
//         },

//         // סדר הבחירה של הלקוחה
//         selectionOrder: {
//             type: Number,
//             default: null
//         }
//     },
//     { _id: true }
// );

// const GallerySchema = new mongoose.Schema(
//     {
//         clientName: {
//             type: String,
//             required: true,
//             trim: true
//         },

//         clientEmail: {
//             type: String,
//             required: true,
//             trim: true
//         },

//         // נשמור כאן את ה-hash של סיסמת הלקוחה
//         clientPassword: {
//             type: String,
//             required: true
//         },

//         maxSelections: {
//             type: Number,
//             required: true,
//             min: 1
//         },

//         images: {
//             type: [ImageSchema],
//             default: []
//         },

//         rawPhotosLink: {
//             type: String,
//             default: ""
//         },

//         editedPhotosLink: {
//             type: String,
//             default: ""
//         },

//         // האם הלקוחה שלחה את הבחירות שלה
//         clientSubmitted: {
//             type: Boolean,
//             default: false
//         },

//         // האם התמונות הסופיות נשלחו ללקוחה
//         finalDelivered: {
//             type: Boolean,
//             default: false
//         }
//     },
//     {
//         timestamps: true
//     }
// );

// module.exports = mongoose.model("Gallery", GallerySchema);




const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
    {
        imageUrl: {
            type: String,
            required: true
        },
watermarkedImageUrl: { 
    type: String, 
    default: "" 
},
        imageName: {
            type: String,
            required: true
        },

        watermarked: {
            type: Boolean,
            default: false
        },

        photographerSelected: {
            type: Boolean,
            default: false
        },

        clientSelected: {
            type: Boolean,
            default: false
        },

        selectionOrder: {
            type: Number,
            default: null
        },
        
        // ההערה שהלקוחה כתבה על התמונה
        clientNote: {
            type: String,
            default: ""
        }

    },
    {
        _id: true
    }
);

// תמונה ערוכה
const EditedImageSchema = new mongoose.Schema(
    {
        imageUrl: {
            type: String,
            required: true
        },
watermarkedImageUrl: {
     type: String, 
     default: ""
     },
        imageName: {
            type: String,
            required: true
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        _id: true
    }
);

const GallerySchema = new mongoose.Schema(
    {
        clientName: {
            type: String,
            required: true,
            trim: true
        },

        clientEmail: {
            type: String,
            required: true,
            trim: true
        },

        clientPassword: {
            type: String,
            required: true
        },

        maxSelections: {
            type: Number,
            required: true,
            min: 1
        },
allowClientDownload: {
    type: Boolean,
    default: false
},
        // התמונות המקוריות בגלריה
        images: {
            type: [ImageSchema],
            default: []
        },

        // התמונות הערוכות
        editedImages: {
            type: [EditedImageSchema],
            default: []
        },

        rawPhotosLink: {
            type: String,
            default: ""
        },

        editedPhotosLink: {
            type: String,
            default: ""
        },

        clientSubmitted: {
            type: Boolean,
            default: false
        },

        finalDelivered: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Gallery",
    GallerySchema
)