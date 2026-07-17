        }

        let order = sequelize.literal('RAND()');
        if (sort === 'price_asc') order = [['price', 'ASC']];
        if (sort === 'price_desc') order = [['price', 'DESC']];
        if (sort === 'recent') order = [['createdAt', 'DESC']];

        const paginationLimit = limit ? parseInt(limit) : 20;