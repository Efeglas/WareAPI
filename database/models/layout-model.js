const { DataTypes, Model } = require('sequelize');

class LayoutModel extends Model {
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
                width: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                }, 
                height: {
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
                modelName: 'Layout',              
            }
        );
        sequelize.sync();
        return this;
    }
}

module.exports = LayoutModel;