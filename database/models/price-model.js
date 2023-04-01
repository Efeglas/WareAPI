const { DataTypes, Model } = require('sequelize');

class PriceModel extends Model {
    static init ( sequelize ) {
        super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                price: {
                    type: DataTypes.FLOAT,
                    allowNull: false
                },                                                          
                visible: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true
                },        
            },
            {
                sequelize,
                modelName: 'Price',              
            }
        );
        sequelize.sync();
        return this;
    }
}

module.exports = PriceModel;