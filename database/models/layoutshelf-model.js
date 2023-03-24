const { DataTypes, Model } = require('sequelize');

class LayoutShelfModel extends Model {
    static init ( sequelize ) {
        super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
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
                modelName: 'LayoutShelf',              
            }
        );
        sequelize.sync();
        return this;
    }
}

module.exports = LayoutShelfModel;