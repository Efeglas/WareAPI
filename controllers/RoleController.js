const Database = require('../database/database.js');

class RoleController {

    static async getRoles () {
        try {
            const roles = await Database.models.RoleModel.findAll({                
                attributes: ['id', "name"], 
                where: {visible: 1}, 
                include: [{model: Database.models.PermissionModel, attributes: ['id', 'name', 'description']}]
            });         
        
            const convertedRoles = roles.map((role) => {
                return role.get({ plain: true });
            });
                 
            return {status: 200, message: `Roles accessed`, data: convertedRoles};
        } catch (error) {
            return {status: 500, message: `Unexpected error [${'getUserProfile()'}]`, data: []};
        }
    }

    static async getPlainRoles () {

        try {
            const roles = await Database.models.RoleModel.findAll({                
                attributes: ['id', "name"], 
                where: {visible: 1},              
            });         
        
            const convertedRoles = roles.map((role) => {
                return role.get({ plain: true });
            });
                  
            return {status: 200, message: `Roles accessed`, data: convertedRoles};
        } catch (error) {
            return {status: 500, message: `Unexpected error [${'getPlainRoles()'}]`, data: []};
        }      
    }

    static async editRole (data) {

        try {
            
            const updatedRole = await Database.models.RoleModel.update({name: data.name}, {where: {id: data.id}});            
            return {status: 200, message: `Role renamed`, data: updatedRole};
        } catch (error) {
            return {status: 500, message: `Unexpected error [${'editRole()'}]`, data: []};
        }
    }

    static async deleteRole (data) {

        try {
            const resultUsers = await Database.models.UserModel.findAll({where: {RoleId: data.role}});
            
            if (resultUsers.length > 0) {

                return {status: 406, message: `Role attached to user`, data: []};
            } else {

                const updatedRole = await Database.models.RoleModel.update({visible: 0}, {where: {id: data.role}});
                const resultConnections = await Database.models.RolePermissionModel.destroy({where: {RoleId: data.role}});              
                return {status: 200, message: `Role deleted`, data: []};
            }
        } catch (error) {
            return {status: 500, message: `Unexpected error [${'deleteRole()'}]`, data: []};
        }
    }

    static async addRole (data) {

        try {
            await Database.models.RoleModel.create({name: data.name});          
            return {status: 200, message: `Role added`, data: []};
        } catch (error) {
            return {status: 500, message: `Unexpected error [${'addRole()'}]`, data: []};
        }
    }

    static async getPermissions () {

        try {
            const permissions = await Database.models.PermissionModel.findAll({attributes: ['id', 'name', 'description']});            
            return {status: 200, message: `Permissions accessed`, data: permissions};
        } catch (error) {
            return {status: 500, message: `Unexpected error [${'getPermissions()'}]`, data: []};
        }
    }

    static async savePermissions (data) {

        try {
            if (data.role === 1) {             
                return {status: 401, message: `Default user, restricted`, data: []};       
            }
        
            const bulkCreateArray = [];
            for (const key in data.checks) {
                if (data.checks[key].value) {
                    bulkCreateArray.push({RoleId: data.role, PermissionId: key});
                }
            }
        
            await Database.models.RolePermissionModel.destroy({where: { RoleId: data.role }});
            await Database.models.RolePermissionModel.bulkCreate(bulkCreateArray);           
                  
            return {status: 200, message: `Permissions changed`, data: []};
        } catch (error) {
            return {status: 500, message: `Unexpected error [${'getPermissions()'}]`, data: []};
        }
    }
}

module.exports = RoleController;