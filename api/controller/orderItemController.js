const OrderItem = require('../models/orderItem');
const createError = require('../util/errorHandle');

exports.createOrderItem = async (req, res) => {
  try {
    const item = new OrderItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getItemsByOrder = async (req, res) => {
  try {
    const items = await OrderItem.find({ order: req.params.orderId }).populate('menuItem');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderItemStatus = async (req, res) => {
  try {
    const updated = await OrderItem.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getBestSellerItems = async (req,res,next ) => {
  try {
    const limit = parseInt (req.query.limit) || 5;
    const daysAgo = parseInt (req.query.days) || 30;

    const dataFilter = {};
    if(daysAgo){
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      dataFilter = {createdAt: {$gte: startDate}};

    }

    const pipeline = [
      ...(Object.keys(dataFilter).length ? [{ $match: dataFilter }] : []),

      {
        $lookup: {
          from: 'menuitems',
          localField: 'menuItem',
          foreignField: '_id',
          as: 'menuItemDetails'
        }
      },

      { $unwind: '$menuItemDetails'},

      {
        $lookup: {
          from: 'categories',
          localField: 'menuItemDetails.category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },

      {
        $group: {
         _id: '$menuItem',                   
          itemName: { $first: '$menuItemDetails.name' },        
          itemImage: { $first: '$menuItemDetails.image' },      
          itemPrice: { $first: '$menuItemDetails.price' },     
          itemDescription: { $first: '$menuItemDetails.description' },
          categoryName: { $first: '$categoryDetails.name' },   
          totalQuantity: { $sum: '$quantity' }, 
          totalRevenue: { 
            $sum: { $multiply: ['$price', '$quantity'] } 
          },
          averageRating: { $avg: '$menuItemDetails.rating' }  
      }
    },

    {
      $sort: {totalQuantity: -1}
    },
    {
      $limit: limit
    },

    {
      $project: {
          _id: 0,                  
          id: '$_id',              
          name: '$itemName',
          image: '$itemImage',
          price: '$itemPrice',
          description: '$itemDescription',
          category: '$categoryName',
          totalQuantity: 1,
          totalRevenue: 1,
          averageRating: 1
        }
    }

    ];

    const bestSellers = await OrderItem.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: bestSellers.length,
      data:  bestSellers
    });
  } catch (err) {
    next(createError(500, "Error fetching best seller items"));
  }
}