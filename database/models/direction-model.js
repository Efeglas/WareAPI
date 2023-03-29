const { DataTypes, Model } = require('sequelize');

class DirectionModel extends Model {
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
                       
            },
            {
                sequelize,
                modelName: 'Direction',              
            }
        );
        sequelize.sync();
        return this;
    }
}

module.exports = DirectionModel;