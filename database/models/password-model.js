const { DataTypes, Model } = require('sequelize');

class PasswordModel extends Model {
    static init ( sequelize ) {
        super.init({
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },              
                password: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                oldPw: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false
                },               
            },
            {
                sequelize,
                modelName: 'Password',              
            }
        );
        sequelize.sync();
        return this;
    }
}

module.exports = PasswordModel;