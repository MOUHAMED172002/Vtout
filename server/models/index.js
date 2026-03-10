console.log("  Loading sequelize config...");
const sequelize = require('../config/database');
console.log("  Sequelize config loaded.");
console.log("  Loading Profile model...");
const Profile = require('./Profile');
console.log("  Loading Category model...");
const Category = require('./Category');
console.log("  Loading Product model...");
const Product = require('./Product');
console.log("  Loading ProductImage model...");
const ProductImage = require('./ProductImage');
console.log("  Loading Order model...");
const Order = require('./Order');
console.log("  Loading OrderItem model...");
const OrderItem = require('./OrderItem');
console.log("  Loading Favorite model...");
const Favorite = require('./Favorite');
console.log("  Loading Address model...");
const Address = require('./Address');
console.log("  Loading Review model...");
const Review = require('./Review');
console.log("  Loading ProductAttribute model...");
const ProductAttribute = require('./ProductAttribute');
console.log("  Loading AttributeValue model...");
const AttributeValue = require('./AttributeValue');
console.log("  Loading CategoryAttribute model...");
const CategoryAttribute = require('./CategoryAttribute');
console.log("  Loading Cart model...");
const Cart = require('./Cart');
const ProductVariant = require('./ProductVariant');
const ProductVariantPrice = require('./ProductVariantPrice');
const Supplier = require('./Supplier');
const SupplierProduct = require('./SupplierProduct');
const CategoryAttributeValue = require('./CategoryAttributeValue');
const DeliveryPerson = require('./DeliveryPerson');
console.log("  Loading FailedSearch model...");
const FailedSearch = require('./FailedSearch');
const Faq = require('./Faq');
const Policy = require('./Policy');
const Config = require('./Config');
console.log("  All models loaded. Setting up associations...");

// --- Relations ---

// Product <-> Review
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Profile <-> Review
Profile.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(Profile, { foreignKey: 'user_id', as: 'user' });

// Product <-> Category
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Category <-> Category (Parent/Children)
Category.hasMany(Category, { foreignKey: 'parent_id', as: 'children' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });

// Category <-> ProductAttribute (Many-to-Many)
Category.belongsToMany(ProductAttribute, { through: CategoryAttribute, foreignKey: 'category_id', as: 'attributes' });
ProductAttribute.belongsToMany(Category, { through: CategoryAttribute, foreignKey: 'attribute_id', as: 'categories' });

// Add direct associations for explicit queries
Category.hasMany(CategoryAttribute, { foreignKey: 'category_id', as: 'categoryAttributes' });
CategoryAttribute.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

ProductAttribute.hasMany(CategoryAttribute, { foreignKey: 'attribute_id', as: 'categoryAttributes' });
CategoryAttribute.belongsTo(ProductAttribute, { foreignKey: 'attribute_id', as: 'attribute' });

// CategoryAttribute <-> CategoryAttributeValue
CategoryAttribute.hasMany(CategoryAttributeValue, { foreignKey: 'category_attribute_id', as: 'attributeValues' });
CategoryAttributeValue.belongsTo(CategoryAttribute, { foreignKey: 'category_attribute_id', as: 'categoryAttribute' });

// AttributeValue <-> CategoryAttributeValue
AttributeValue.hasMany(CategoryAttributeValue, { foreignKey: 'value_id', as: 'categoryLinks' });
CategoryAttributeValue.belongsTo(AttributeValue, { foreignKey: 'value_id', as: 'value' });

// ProductAttribute <-> AttributeValue (One-to-Many)
ProductAttribute.hasMany(AttributeValue, { foreignKey: 'attribute_id', as: 'values' });
AttributeValue.belongsTo(ProductAttribute, { foreignKey: 'attribute_id', as: 'attribute' });

// Product <-> ProductImage
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Profile <-> Order
Profile.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(Profile, { foreignKey: 'user_id', as: 'user' });

// Profile <-> Address
Profile.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });
Address.belongsTo(Profile, { foreignKey: 'user_id', as: 'user' });

// Order <-> Address
Order.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });

// Profile <-> DeliveryPerson
Profile.hasOne(DeliveryPerson, { foreignKey: 'user_id', as: 'deliveryInfo' });
DeliveryPerson.belongsTo(Profile, { foreignKey: 'user_id', as: 'profile' });

// Order <-> DeliveryPerson
DeliveryPerson.hasMany(Order, { foreignKey: 'delivery_person_id', as: 'deliveries' });
Order.belongsTo(DeliveryPerson, { foreignKey: 'delivery_person_id', as: 'deliveryPerson' });

// Order <-> Supplier
Supplier.hasMany(Order, { foreignKey: 'supplier_id', as: 'orders' });
Order.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// OrderItem <-> Product
Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// OrderItem <-> ProductVariant
ProductVariant.hasMany(OrderItem, { foreignKey: 'variant_id' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

// Favorites
Profile.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
Favorite.belongsTo(Profile, { foreignKey: 'user_id', as: 'user' });
Product.hasMany(Favorite, { foreignKey: 'product_id', as: 'favorites' });
Favorite.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Favorite.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

// Cart items
Profile.hasMany(Cart, { foreignKey: 'user_id', as: 'cartItems' });
Cart.belongsTo(Profile, { foreignKey: 'user_id', as: 'user' });
Product.hasMany(Cart, { foreignKey: 'product_id', as: 'cartItems' });
Cart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Cart.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

// Variants
Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

ProductVariant.hasMany(ProductVariantPrice, { foreignKey: 'variant_id', as: 'priceRows' });
ProductVariantPrice.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

// Profile <-> Supplier
Profile.hasOne(Supplier, { foreignKey: 'user_id', as: 'supplierProfile' });
Supplier.belongsTo(Profile, { foreignKey: 'user_id', as: 'user' });

// Suppliers relations
Supplier.hasMany(SupplierProduct, { foreignKey: 'supplier_id', as: 'suppliedProducts' });
SupplierProduct.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

// Supplier <-> Product
Supplier.hasMany(Product, { foreignKey: 'supplier_id', as: 'products' });
Product.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

Product.hasMany(SupplierProduct, { foreignKey: 'product_id', as: 'supplierLink' });
SupplierProduct.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

ProductVariant.hasMany(SupplierProduct, { foreignKey: 'variant_id', as: 'supplierLink' });
SupplierProduct.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });


// --- Export Everything ---
module.exports = {
    sequelize,
    Profile,
    Category,
    Product,
    ProductImage,
    Order,
    OrderItem,
    Favorite,
    Address,
    Review,
    ProductAttribute,
    AttributeValue,
    CategoryAttribute,
    Cart,
    ProductVariant,
    ProductVariantPrice,
    Supplier,
    SupplierProduct,
    CategoryAttributeValue,
    DeliveryPerson,
    FailedSearch,
    Faq,
    Policy,
    Config
};
