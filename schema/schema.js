const graphql = require('graphql');
const axios = require('axios');

const API_URL = 'http://localhost:3000';

const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema, GraphQLList, GraphQLNonNull } = graphql;

// COMPANY TYPE
const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                return axios.get(`${API_URL}/companies/${parentValue.id}/users`).then((res) => res.data);
            },
        },
    }),
});

// USER TYPE
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                return axios.get(`${API_URL}/companies/${parentValue.companyId}`).then((res) => res.data);
            },
        },
    }),
});

// ROOT QUERY
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        // user entry point
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return axios.get(`${API_URL}/users/${args.id}`).then((res) => res.data);
            },
        },
        // company entry point
        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return axios.get(`${API_URL}/companies/${args.id}`).then((res) => res.data);
            },
        },
    },
});

// ROOT MUTATION
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        // ADD USER MUTATIOB
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString },
            },
            resolve(parentValue, { firstName, age }) {
                return axios.post(`${API_URL}/users`, { firstName, age }).then((res) => res.data);
            },
        },
        // DELETE USER MUTATION
        deleteUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parentValue, { id }) {
                return axios.delete(`${API_URL}/users/${id}`);
            },
        },
        // EDIT USER MUTATION
        editUser: {
            type: UserType,
            args: {
                id: { type: GraphQLString },
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
            },
            resolve(parentValue, args) {
                return axios.patch(`${API_URL}/users/${args.id}`, args).then((res) => res.data);
            },
        },
    },
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation,
});
