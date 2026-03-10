const { ProductAttribute, AttributeValue, CategoryAttribute, CategoryAttributeValue, sequelize } = require('./models');

async function testFullLogic() {
    try {
        console.log("Testing FULL getAttributesByCategory logic...");
        const category_id = 3;

        // 1. Get all attributes linked to this category through the CategoryAttribute junction
        const categoryAttrs = await CategoryAttribute.findAll({
            where: { category_id },
            include: [
                {
                    model: ProductAttribute,
                    as: 'attribute',
                    include: [{ model: AttributeValue, as: 'values' }]
                },
                {
                    model: CategoryAttributeValue,
                    as: 'attributeValues',
                    include: [{ model: AttributeValue, as: 'value' }]
                }
            ]
        });

        console.log(`Found ${categoryAttrs.length} category-attribute links.`);

        const formatted = categoryAttrs.map(ca => {
            if (!ca.attribute) {
                console.warn(`[getAttributesByCategory] No attribute found for CategoryAttribute link ID: ${ca.id}`);
                return null;
            }

            const attr = ca.attribute.toJSON();
            const filteredValues = ca.attributeValues ? ca.attributeValues.map(v => v.value).filter(v => !!v) : [];

            console.log(`- Attribute: ${attr.name}, Total Values: ${attr.values.length}, Filtered Values: ${filteredValues.length}`);

            return {
                ...attr,
                values: filteredValues.length > 0 ? filteredValues : (attr.values || [])
            };
        }).filter(item => item !== null);

        console.log("Formatted output length:", formatted.length);
        console.log("Logic verified successfully.");
        process.exit(0);
    } catch (error) {
        console.error("FULL Logic test failed:", error);
        process.exit(1);
    }
}

testFullLogic();
