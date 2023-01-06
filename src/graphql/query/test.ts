export const test = `
query ($id: Int!) {
    test (
        id: $id
    ) {
        __typename
        id
        name
    }
}
`;
