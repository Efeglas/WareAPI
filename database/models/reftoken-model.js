const { DataTypes, Model } = require('sequelize');

class RefreshTokenModel extends Model {
    static init ( sequelize ) {
        super.init({
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },               
                token: {
                    type: DataTypes.STRING,
                    allowNull: false
                },              
                valid: {
                    type: DataTypes.DATE,  
                    allowNull: false               
                },               
            },
            {
                sequelize,
                modelName: 'RefreshToken', 
                timestamps: false             
            }
        );
        sequelize.sync();
        return this;
    }
}

module.exports = RefreshTokenModel;