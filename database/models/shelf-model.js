const { DataTypes, Model } = require('sequelize');

class ShelfModel extends Model {
    static init ( sequelize ) {
        super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false
                },  
                levels: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },   
                x1: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                }, 
                y1: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },  
                x2: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                }, 
                y2: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },                                        
                visible: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true
                },        
            },
            {
                sequelize,
                modelName: 'Shelf',              
            }
        );
        sequelize.sync();
        return this;
    }
}

module.exports = ShelfModel;