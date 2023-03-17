const { DataTypes, Model } = require('sequelize');

class UserModel extends Model {
    static init ( sequelize ) {
        super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                username: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                ownPw: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false
                },
                firstName: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                lastName: {
                  type: DataTypes.STRING,
                  allowNull: false               
                },
                phone: {
                    type: DataTypes.STRING,                  
                },               
                visible: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true
                },        
            },
            {
                sequelize,
                modelName: 'User',              
            }
        );
        sequelize.sync();
        return this;
    }
}

module.exports = UserModel;