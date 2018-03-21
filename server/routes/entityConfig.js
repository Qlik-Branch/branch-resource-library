module.exports = {
    userprofile:{
      collection: "userprofiles",
      model: require("../models/userprofile"),
      fields: { apiKey: 0},
      populates: "role",
      exemptFromOwnership: false,
      exemptFromApproval: false,
      logViews: false,
      sort: {
        username: 1
      },
      limit: 10,
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    project:{
      collection: "projects",
      model: require("../models/project"),
      populates: [{ path: 'userid', select: '-apiKey' },{path: 'category'},{path: 'product'}, {path: 'status'}],
      exemptFromOwnership: false,
      exemptFromApproval: false,
      logViews: true,
      sort: {
        dateline: -1
      },
      limit: 20,
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
  publication:{
      collection: "publications",
      model: require("../models/publication"),
      populates: "",
      exemptFromOwnership: true,
      exemptFromApproval: true,
      logViews: false,
      sort: {
        dateline: -1
      },
      limit: 20,
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    resource:{
      collection: "resources",
      model: require("../models/resource"),
      populates: "userid resourceType category",
      exemptFromOwnership: false,
      exemptFromApproval: false,
      logViews: true,
      sort: {
        dateline: -1
      },
      limit: 20,
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    rating: {
      collection: "ratings",
      model: require("../models/rating"),
      populates: { path: 'userid', select: '-apiKey' },
      requiresAuthentication: true,
      exemptFromOwnership: false,
      exemptFromApproval: true,
      logViews: false,
      limit: 10,
    },
    subscription: {
      collection: "subscriptions",
      model: require("../models/subscription"),
      populates: { path: 'userid', select: '-apiKey' },
      requiresAuthentication: true,
      exemptFromOwnership: false,
      exemptFromApproval: true,
      logViews: false,
      limit: 10,
    },
    view: {
      collection: "views",
      model: require("../models/views"),
      populates: { path: 'userid', select: '-apiKey' },
      requiresAuthentication: false,
      exemptFromOwnership: true,
      exemptFromApproval: true,
      logViews: false,
      limit: 10,
    },
    article:{
      collection: "articles",
      model: require("../models/article"),
      populates: { path: 'userid', select: '-apiKey' },
      exemptFromOwnership: false,
      exemptFromApproval: false,
      logViews: true,
      sort: {
        dateline: -1
      },
      limit: 10,
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    comment:{
      collection: "comments",
      model: require("../models/comment"),
      populates: { path: 'userid', select: '-apiKey' },
      exemptFromOwnership: false,
      exemptFromApproval: false,
      logViews: false,
      sort: {
        dateline: -1
      },
      limit: 10,
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    userrole:{
      collection: "userroles",
      model: require("../models/userrole"),
      populates: "",
      exemptFromOwnership: true,
      exemptFromApproval: true,
      logViews: false,
      sort: {
        name: 1
      },
      requiresAuthentication: true    //only applies to GET requests. All other requests MUST be authenticated
    },
    feature:{
      collection: "features",
      model: require("../models/feature"),
      populates: { path: 'userid', select: '-apiKey' },
      exemptFromOwnership: true,
      exemptFromApproval: true,
      logViews: false,
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
      logViews: false,
      sort: {
        name: 1
      },
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    product:{
      collection: "products",
      model: require("../models/product"),
      populates: "",
      exemptFromOwnership: true,
      exemptFromApproval: true,
      logViews: false,
      sort: {
        name: 1
      },
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    picklist: {
      collection: "picklists",
      model: require("../models/picklist"),
      populates: "",
      exemptFromOwnership: true,
      exemptFromApproval: true,
      logViews: false,
      sort: {
        name: 1
      },
      requiresAuthentication: false
    },
    picklistitem: {
      collection: "picklistitems",
      model: require("../models/picklistitem"),
      populates: "",
      exemptFromOwnership: true,
      exemptFromApproval: true,
      logViews: false,
      sort: {
        seq: 1
      },
      requiresAuthentication: false
    },
    flag: {
      collection: "flags",
      model: require("../models/flag"),
      populates: { path: 'userid', select: '-apiKey' },
      exemptFromOwnership: true,
      exemptFromApproval: true,
      logViews: false,
      sort: {
        name: 1
      },
      requiresAuthentication: true
    }
};
