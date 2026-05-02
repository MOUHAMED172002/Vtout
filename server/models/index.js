import sequelize from '../config/database.js';
import Profile from './Profile.js';
import Category from './Category.js';
import Product from './Product.js';
import ProductImage from './ProductImage.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Favorite from './Favorite.js';
import Address from './Address.js';
import Review from './Review.js';
import ProductAttribute from './ProductAttribute.js';
import AttributeValue from './AttributeValue.js';
import CategoryAttribute from './CategoryAttribute.js';
import Cart from './Cart.js';
import ProductVariant from './ProductVariant.js';
import ProductVariantPrice from './ProductVariantPrice.js';
import Supplier from './Supplier.js';
import SupplierProduct from './SupplierProduct.js';
import CategoryAttributeValue from './CategoryAttributeValue.js';
import DeliveryPerson from './DeliveryPerson.js';
import FailedSearch from './FailedSearch.js';
import SupportMessage from './SupportMessage.js';
import Boutique from './Boutique.js';
import PlatformReview from './PlatformReview.js';
import Faq from './Faq.js';
import Policy from './Policy.js';
import Config from './Config.js';
import FinancialTransaction from './FinancialTransaction.js';
import PayoutRequest from './PayoutRequest.js';
import Coupon from './Coupon.js';
import Dispute from './Dispute.js';
import Department from './Department.js';
import Commune from './Commune.js';
import Arrondissement from './Arrondissement.js';
import Quartier from './Quartier.js';
import Notification from './Notification.js';
import Blog from './Blog.js';
import Otp from './Otp.js';

// --- Relations ---

// Geography
Department.hasMany(Commune, { foreignKey: 'department_id', as: 'communes' });
Commune.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

Commune.hasMany(Arrondissement, { foreignKey: 'commune_id', as: 'arrondissements' });
Arrondissement.belongsTo(Commune, { foreignKey: 'commune_id', as: 'commune' });

Arrondissement.hasMany(Quartier, { foreignKey: 'arrondissement_id', as: 'quartiers' });
Quartier.belongsTo(Arrondissement, { foreignKey: 'arrondissement_id', as: 'arrondissement' });

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

// Supplier <-> Boutique
Supplier.hasMany(Boutique, { foreignKey: 'supplier_id', as: 'boutiques' });
Boutique.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

// Boutique <-> Product
Boutique.hasMany(Product, { foreignKey: 'boutique_id', as: 'products' });
Product.belongsTo(Boutique, { foreignKey: 'boutique_id', as: 'boutique' });

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

// Support Messages
SupportMessage.belongsTo(Profile, { foreignKey: 'sender_id', as: 'sender' });
SupportMessage.belongsTo(Profile, { foreignKey: 'receiver_id', as: 'receiver' });
Profile.hasMany(SupportMessage, { foreignKey: 'sender_id', as: 'sentMessages' });
Profile.hasMany(SupportMessage, { foreignKey: 'receiver_id', as: 'receivedMessages' });

// Reviews
Review.belongsTo(Profile, { foreignKey: 'user_id', as: 'author' });
Profile.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });

// Platform Reviews
PlatformReview.belongsTo(Profile, { foreignKey: 'user_id', as: 'author' });
Profile.hasMany(PlatformReview, { foreignKey: 'user_id', as: 'platformReviews' });

// Financials
Profile.hasMany(FinancialTransaction, { foreignKey: 'user_id', as: 'transactions' });
FinancialTransaction.belongsTo(Profile, { foreignKey: 'user_id', as: 'user' });

Profile.hasMany(PayoutRequest, { foreignKey: 'user_id', as: 'payoutRequests' });
PayoutRequest.belongsTo(Profile, { foreignKey: 'user_id', as: 'user' });

// Disputes
Profile.hasMany(Dispute, { foreignKey: 'user_id', as: 'disputes' });
Dispute.belongsTo(Profile, { foreignKey: 'user_id', as: 'user' });

Supplier.hasMany(Dispute, { foreignKey: 'supplier_id', as: 'disputes' });
Dispute.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

Order.hasMany(Dispute, { foreignKey: 'order_id', as: 'disputes' });
Dispute.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Blogs
Blog.belongsTo(Profile, { foreignKey: 'author_id', as: 'author' });
Profile.hasMany(Blog, { foreignKey: 'author_id', as: 'blogs' });

// --- Final Consolidations ---
// (Avoiding duplicates that caused 'alias user' errors)

export {
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
    Config,
    SupportMessage,
    Boutique,
    PlatformReview,
    FinancialTransaction,
    PayoutRequest,
    Coupon,
    Dispute,
    Department,
    Commune,
    Arrondissement,
    Quartier,
    Notification,
    Blog,
    Otp
};
