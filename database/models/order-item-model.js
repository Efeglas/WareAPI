const { DataTypes, Model } = require('sequelize');

class OrderItemModel extends Model {
    static init ( sequelize ) {
        super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },                             
                quantity: {
                    type: DataTypes.FLOAT,      
                    allowNull: false                          
                },                                             
                       
            },
            {
                sequelize,
                modelName: 'OrderItem',              
            }
        );
        sequelize.sync();
        return this;
    }
}

module.exports = OrderItemModel;