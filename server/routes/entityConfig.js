module.exports = {
    users:{
      collection: "users",
      model: require("../models/user"),
      populates: "role",
      exemptFromOwnership: false,
      exemptFromApproval: true,
      sort: {
        username: 1
      },
      limit: 10,
      requiresAuthentication: true    //only applies to GET requests. All other requests MUST be authenticated
    },
    projects:{
      collection: "projects",
      model: require("../models/project"),
      populates: "userid",
      exemptFromOwnership: false,
      exemptFromApproval: false,
      sort: {
        dateline: -1
      },
      limit: 20,
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    articles:{
      collection: "articles",
      model: require("../models/article"),
      populates: "userid",
      exemptFromOwnership: false,
      exemptFromApproval: false,
      sort: {
        dateline: -1
      },
      limit: 10,
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    comments:{
      collection: "comments",
      model: require("../models/comment"),
      populates: "userid",
      exemptFromOwnership: false,
      exemptFromApproval: false,
      sort: {
        dateline: -1
      },
      limit: 10,
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    userroles:{
      collection: "userroles",
      model: require("../models/userrole"),
      populates: "",
      exemptFromOwnership: true,
      exemptFromApproval: true,
      sort: {
        name: 1
      },
      requiresAuthentication: true    //only applies to GET requests. All other requests MUST be authenticated
    },
    features:{
      collection: "features",
      model: require("../models/feature"),
      populates: "",
      exemptFromOwnership: true,
      exemptFromApproval: true,
      sort: {
        name: 1
      },
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    projectcategories:{
      collection: "projectcategories",
      model: require("../models/projectcategory"),
      populates: "",
      exemptFromOwnership: true,
      exemptFromApproval: true,
      sort: {
        name: 1
      },
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    products:{
      collection: "products",
      model: require("../models/product"),
      populates: "",
      exemptFromOwnership: true,
      exemptFromApproval: true,
      sort: {
        name: 1
      },
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    }
};
