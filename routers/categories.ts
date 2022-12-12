import { Router } from 'express';
import  Category from '../models/category';

const router = Router();

router.get('/', (req, res) =>{
    Category.find().then(categories => {
        res.send(categories);
    }).catch(err =>{
        res.status(500).send(err);
    })
});

router.get('/:id', async (req, res) =>{
    const category = await Category.findById(req.params.id);
    if(!category){
        res.status(400).send('The category with the given ID was not found!');
    }

    res.send(category);
});

router.post('/', (req, res) =>{
    const { name, icon, color} = req.body;
    const category = new Category({
        name, icon, color
    });
    category.save().then(category => {
        res.send(category);
    }).catch(err => {
        res.status(500).send('The category cannot created!');
    })
});

router.put('/:id', async (req, res) =>{
    const { name, icon, color} = req.body;
    Category.findByIdAndUpdate(req.params.id, {
        name, icon, color
    }, 
    { new: true}
    ).then(data => {
        res.status(200).json('Update the category successfully')
    }).catch(err => {
        res.status(500).json({sucss: false, message: err})
    })
});

router.delete('/:id', (req, res)=>{
    Category.findByIdAndRemove(req.params.id).then(data =>{
        if(!data){
           return res.status(400).json({success: false, message: 'The category not found!'});
        }
        return res.status(200).json({success: true, message: 'The category is deleted!'});
    }).catch(err =>{
        res.status(400).json({success: false, err: err});
    })
});

export default router;