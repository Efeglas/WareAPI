const { DataTypes, Model } = require('sequelize');

class MeasureModel extends Model {
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
                visible: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true
                },        
            },
            {
                sequelize,
                modelName: 'Measure',              
            }
        );
        sequelize.sync();
        return this;
    }
}

module.exports = MeasureModel;