export const mockedEmptySuccessResponse = {
    data: {
        content: [],
        number: 0,
        size: 3,
    }
}

export const mockSuccessGetSinglePage = {
    data: {
        content: [
            {
                username: 'user1',
                displayName: 'display1',
                image: ''
            },
            {
                username: 'user2',
                displayName: 'display2',
                image: ''
            },
            {
                username: 'user3',
                displayName: 'display3',
                image: ''
            },
        ],
        number: 0,
        first: true,
        last: true,
        size: 3,
        totalPages: 1
    }
}

export const mockSuccessGetMultiPageFirst = {
    data: {
        content: [
            {
                username: 'user1',
                displayName: 'display1',
                image: ''
            },
            {
                username: 'user2',
                displayName: 'display2',
                image: ''
            },
            {
                username: 'user3',
                displayName: 'display3',
                image: ''
            },
        ],
        number: 0,
        first: true,
        last: false,
        size: 3,
        totalPages: 2,
    }
}

export const mockSuccessGetMultiPageLast = {
    data: {
        content: [
            {
                username: 'user4',
                displayName: 'display4',
                image: ''
            },
        ],
        number: 1,
        first: false,
        last: true,
        size: 3,
        totalPages: 2,
    }
}

export const mockFailGet = {
    data: {
        content: [
            {
                errorMessage: 'error'
            }
        ]
    }
}