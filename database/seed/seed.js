const Database = require('../database.js');
const { config } = require('../../config/config.js');
const bcrypt = require('bcrypt');

console.log(Database);

const seed = async () => {

    console.log("Seed started!");

    let admin = await Database.models.UserModel.findOne({where: {username: "admin"}});
    if (admin === null) {
        admin = await Database.models.UserModel.create({
            username: "admin",
            email: "admin@admin.com",
            firstName: "Admin",
            lastName: "User",
            phone: "0630",
        });
    }

    bcrypt.hash("adminuser", config.bcrypt.saltRounds, async (err, hash) => {
        
        let password = await Database.models.PasswordModel.create({password: hash, ownPW: 0, UserId: admin.id});       
    });

    let adminRole = await Database.models.RoleModel.findOne({where: {name: "Admin"}});
    if (adminRole === null) {
        adminRole = await Database.models.RoleModel.create({
            name: "Admin",              
        });
        
        await Database.models.UserModel.update({RoleId: adminRole.id}, {where: {id: admin.id}});
    }

    let permissions = await Database.models.PermissionModel.findAll();
    if (permissions.length === 0) {

        const permissions = [
            {name: "Roles", description: "Access role page. Add, edit, delete roles. Set permissions to roles."},
            {name: "Users", description: "Access user page. Register, edit, remove users. Set user roles. Reset password for users."},
            {name: "Layout", description: "Access layout page. Add, edit and delete layouts. Add, edit and delete shelves. Placing shelves."},
        ];
        const addedPermissions = [];
        
        for (const per of permissions) {
            
            const added = await Database.models.PermissionModel.create(per);
            addedPermissions.push(added);
        }
        
        for (const addedPerm of addedPermissions) {
            
            await Database.models.RolePermissionModel.create({RoleId: adminRole.id, PermissionId: addedPerm.id});
        }

    }

    const bulkMeasures = [
        {name: "kg"},
        {name: "m"},
        {name: "l"},
        {name: "pcs"},
    ];

    await Database.models.MeasureModel.bulkCreate(bulkMeasures);

    console.log("Seeding done!");
}

setTimeout(() =>{
    seed();
}, 5000);