import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from 'path';

import Product from "../models/product";
import Category from "../models/category";

interface FileType {
  'image/png': string;
   'image/jpeg': string;
   'image/jpg': string
}

const FILE_TYPE_MAP: FileType = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let isValid = FILE_TYPE_MAP[file.mimetype as keyof FileType];

    let uploadError = null;
    if(!isValid){
      uploadError = new Error('Invalid file type');
    }

    cb(uploadError, path.resolve('public/uploads/'));
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extention = FILE_TYPE_MAP[file.mimetype as keyof FileType];
    cb(null, `${fileName}-${Date.now()}.${extention}`);
  },
});

const uploadOption = multer({ storage: storage })

const router = Router();

router.get("/", (req: any, res: Response) => {
  console.log('dd')
  let filter = {};

  if (req.query.categories) {
    filter = {
      category: (req.query.categories as string).split(","),
    };
  }

  Product.find(filter)
    .populate("category").sort({dateCreated: -1})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.get("/:id", (req, res) => {
  Product.findById(req.params.id)
    .populate("category")
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.post("/", uploadOption.single('image'), async (req, res) => {
  console.log(req)
  const isCategoryId = mongoose.isValidObjectId(req.body.category);
  console.log(isCategoryId)
  if (!isCategoryId) {
    return res.status(400).send("Category ID is not valid!");
  }

  const isCategoryExited = await Category.findById(req.body.category);
  if (!isCategoryExited) {
    res.status(500).send("Category ID is invalid!");
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(500).send("No image in the request");
    return;
  }

  const fileName = req.file?.filename;
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
  const imageUrl = `${basePath}${fileName}`;

  const {
    name,
    description,
    productDetail,
    images,
    brand,
    price,
    category,
    countInStock,
    rating,
    numReviews,
    isFeatured,
    dateCreated,
  } = req.body;

  const product = new Product({
    name,
    description,
    productDetail,
    image: `${basePath}${fileName}`,
    images,
    brand,
    price,
    category,
    countInStock,
    rating,
    numReviews,
    isFeatured,
    dateCreated,
  });

  product
    .save()
    .then((createdProduct) => {
      res.status(201).json(createdProduct);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.put("/:id", uploadOption.single('image'), async (req, res) => {
  console.log(req.body)
  const isCategoryId = mongoose.isValidObjectId(req.body.category);
  console.log(isCategoryId)
  if (!isCategoryId) {
    res.status(400).send("Category ID is not valid!");
    return;
  }

  const isCategoryExited = await Category.findById(req.body.category);
  if (!isCategoryExited) {
    res.status(500).send("Category ID is invalid!");
    return;
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(500).send("Product ID is invalid!");
    return;
  }

  const file = req.file;
  let imagePath;
  if(file){
    const fileName = req.file?.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    imagePath = `${basePath}${fileName}`;
  }else{
    imagePath = product.image;
  }

  const {
    name,
    description,
    productDetail,
    image,
    images,
    brand,
    price,
    category,
    countInStock,
    rating,
    numReviews,
    isFeatured,
    dateCreated,
  } = req.body;

  Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      productDetail,
      image: imagePath,
      images,
      brand,
      price,
      category,
      countInStock,
      rating,
      numReviews,
      isFeatured,
      dateCreated,
    },
    { new: true }
  )
    .populate("category")
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.put('/gallery-images/:id', uploadOption.array('images', 20), async(req, res) =>{
  const productId = mongoose.isValidObjectId(req.params.id);
  if (!productId) {
    res.status(400).send("Product ID is not valid!");
    return;
  }

  const imagePaths: Array<string> = [];
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
  const images: any = req.files;

  if(!images || images.length < 1){
    res.status(500).send("No image in the request");
    return;
  }

  images.map((image: any) => {
    imagePaths.push(`${basePath}${image.filename}`)
  })

  const product = await Product.findByIdAndUpdate(req.params.id,{
    images: imagePaths
  }, {new: true})

  if(!product){
    res.status(500).send({success: false, message: 'Update image failed'})
  }

  res.send(product);
})

router.delete("/:id", async (req, res) => {
  const isProductId = mongoose.isValidObjectId(req.params.id);
  if (!isProductId) {
    res.status(500).send("Product ID is invalid!");
    return;
  }

  const product = await Product.findByIdAndRemove(req.params.id);
  if (!product) {
    res.status(400).send("Delete the product was failed!");
    return;
  }

  res
    .status(200)
    .send({ success: true, message: "Delete product is successfully!" });
});

router.get("/get/count", async (req, res) => {
  const count = await Product.countDocuments();
  if (!count) {
    res.status(400).send({ success: false });
    return;
  }
  res.send({ count });
});

router.get("/get/featured/:count", async (req, res) => {
  const limit: number = req.params.count ? +req.params.count : 0;
  const product = await Product.find({ isFeatured: true }).limit(limit);
  if (!product) {
    res.status(400).send({ success: false });
  }

  res.send(product);
});

export default router;
