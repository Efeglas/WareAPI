const { DataTypes, Model } = require('sequelize');

class RolePermissionModel extends Model {
    static init ( sequelize ) {
        super.init({
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },                             
                visible: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true
                },               
            },
            {
                sequelize,
                modelName: 'RolePermission',  
                timestamps: false            
            }
        );
        sequelize.sync();
        return this;
    }
}

module.exports = RolePermissionModel;