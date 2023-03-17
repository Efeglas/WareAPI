const { DataTypes, Model } = require('sequelize');

class PermissionModel extends Model {
    static init ( sequelize ) {
        super.init({
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },               
                name: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                description: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                visible: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true
                },               
            },
            {
                sequelize,
                modelName: 'Permission', 
                timestamps: false             
            }
        );
        sequelize.sync();
        return this;
    }
}

module.exports = PermissionModel;