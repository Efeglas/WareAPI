const { DataTypes, Model } = require('sequelize');

class RoleModel extends Model {
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
                visible: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true
                },               
            },
            {
                sequelize,
                modelName: 'Role',              
            }
        );
        sequelize.sync();
        return this;
    }
}

module.exports = RoleModel;