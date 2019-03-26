export default class Perspective {

    constructor(id, name, group, requireAny) {
        this.id = id;
        this.name = name;
        this.group = group;
        this.requireAny = requireAny;
    }

    testUser(user) {
        for (var capKey in this.requireAny) {
            if (user.hasCapability(this.requireAny[capKey])) return true;
        }
        return false;
    }
}
