const AccessControl = require("accesscontrol");
const ac = new AccessControl();

exports.roles = (function() {
  ac.grant("user")
    .readOwn("profile")
    .updateOwn("profile");

  ac.grant("executive")
    .extend("user")
    .readAny("profile");

  ac.grant("admin")
    .extend("user")
    .extend("executive")
    .updateAny("profile")
    .deleteAny("profile");

  return ac;
})();
