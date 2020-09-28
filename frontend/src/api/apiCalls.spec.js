import axios from 'axios';
import * as apiCalls from './apiCalls'

describe('apiCalls', () => {
    
    describe('signup', () => {

        it('calls /api/1.0/users', () => {
            const mockSignup = jest.fn();
            axios.post = mockSignup;
            
            apiCalls.signup();
            //we get here the first parameter of the first call of this call
            const path = mockSignup.mock.calls[0][0];
            
            expect(path).toBe('/api/1.0/users');
        });
    });

    describe('login', () => {

        it('calls /api/1.0/login', () => {
            const mockLogin = jest.fn();
            axios.post = mockLogin;
            
            apiCalls.login({username: 'test-user', password: 'P4ssword'});
            const path = mockLogin.mock.calls[0][0];
            
            expect(path).toBe('/api/1.0/login');
        })
    })

    describe('listUser', () => {
        it('calls /api/1.0/users?page=0&size=3 when no parametr provided for listUsers', () => {
            const mockListUsers = jest.fn();
            axios.get = mockListUsers;

            apiCalls.listUsers();

            expect(mockListUsers).toBeCalledWith('/api/1.0/users?page=0&size=3');
        });

        it('calls /api/1.0/users?page=5&size=10 when corresponding parameters provided for listUsers', () => {
            const mockListUsers = jest.fn();
            axios.get = mockListUsers;

            apiCalls.listUsers({page: 5, size: 10});

            expect(mockListUsers).toBeCalledWith('/api/1.0/users?page=5&size=10');
        });

        it('calls /api/1.0/users?page=5&size=3 when only page parameter provided for listUsers', () => {
            const mockListUsers = jest.fn();
            axios.get = mockListUsers;

            apiCalls.listUsers({page: 5});

            expect(mockListUsers).toBeCalledWith('/api/1.0/users?page=5&size=3');
        });

        it('calls /api/1.0/users?page=0&size=5 when only size parameter provided for listUsers', () => {
            const mockListUsers = jest.fn();
            axios.get = mockListUsers;

            apiCalls.listUsers({size: 5});

            expect(mockListUsers).toBeCalledWith('/api/1.0/users?page=0&size=5');
        });
    });

    describe('get User', () => {
        it('calls /api/1.0/users/user5 when user5 is provided for getUser()', () => {
            const mockGetUser = jest.fn();
            axios.get = mockGetUser;

            apiCalls.getUser('user5');

            expect(mockGetUser).toBeCalledWith('/api/1.0/users/user5');
        })
    });

    describe('update user', () => {

        it('calls /api/1.0/users/5 when 5 is provided for updateUser', () => {
            const mockUpdateUser = jest.fn();
            axios.put = mockUpdateUser;
            
            apiCalls.updateUser('5');
            const path = mockUpdateUser.mock.calls[0][0];
            
            expect(path).toBe('/api/1.0/users/5');
        });
    });

    describe('post waves', () => {
        it ('calls /api/1.0/waves', () => {
            const mockPostWave = jest.fn();
            axios.post = mockPostWave;
            
            apiCalls.postWave();
            const path = mockPostWave.mock.calls[0][0];
            
            expect(path).toBe('/api/1.0/waves');
        });
    });

    describe('load waves', () => {
        it('calls /api/1.0/waves?page=0&size=5&sort=id,desc when no params provided', () => {
            const mockGetWaves = jest.fn();
            axios.get = mockGetWaves;
            
            apiCalls.loadWaves();
            
            expect(mockGetWaves).toBeCalledWith('/api/1.0/waves?page=0&size=5&sort=id,desc');
        });

        it('calls /api/1.0/users/user1/waves?page=0&size=5&sort=id,desc when user param is provided', () => {
            const mockGetWaves = jest.fn();
            axios.get = mockGetWaves;
            
            apiCalls.loadWaves('user1');
            
            expect(mockGetWaves).toBeCalledWith('/api/1.0/users/user1/waves?page=0&size=5&sort=id,desc');
        });
    });

    describe('loadOldWaves', () => {

        it('calls /api/1.0/waves/5?direction=before&page=0&size=5&sort=id,desc when wave id param is provided', () => {
            const mockGetWaves = jest.fn();
            axios.get = mockGetWaves;
            
            apiCalls.loadOldWaves(5);
            
            expect(mockGetWaves).toBeCalledWith('/api/1.0/waves/5?direction=before&page=0&size=5&sort=id,desc');
        });

        it('calls /api/1.0/users/user3/waves/5?direction=before&page=0&size=5&sort=id,desc when wave id and user id param are provided', () => {
            const mockGetWaves = jest.fn();
            axios.get = mockGetWaves;
            
            apiCalls.loadOldWaves(5, 'user3');
            
            expect(mockGetWaves).toBeCalledWith('/api/1.0/users/user3/waves/5?direction=before&page=0&size=5&sort=id,desc');
        });
    });

    describe('loadNewWaves', () => {

        it('calls /api/1.0/waves/5?direction=after&sort=id,desc when wave id param is provided', () => {
            const mockGetWaves = jest.fn();
            axios.get = mockGetWaves;
            
            apiCalls.loadNewWaves(5);
            
            expect(mockGetWaves).toBeCalledWith('/api/1.0/waves/5?direction=after&sort=id,desc');
        });

        it('calls /api/1.0/users/user3/waves/5?direction=after&sort=id,desc when wave id and user id param are provided', () => {
            const mockGetWaves = jest.fn();
            axios.get = mockGetWaves;
            
            apiCalls.loadNewWaves(5, 'user3');
            
            expect(mockGetWaves).toBeCalledWith('/api/1.0/users/user3/waves/5?direction=after&sort=id,desc');
        });
    });

    describe('loadNewWaveCount', () => {

        it('calls /api/1.0/waves/5?direction=after&count=true when wave id param is provided', () => {
            const mockGetWaves = jest.fn();
            axios.get = mockGetWaves;
            
            apiCalls.loadNewWaveCount(5);
            
            expect(mockGetWaves).toBeCalledWith('/api/1.0/waves/5?direction=after&count=true');
        });

        it('calls /api/1.0/users/user3/waves/5?direction=after&count=true when wave id and user id param are provided', () => {
            const mockGetWaves = jest.fn();
            axios.get = mockGetWaves;
            
            apiCalls.loadNewWaveCount(5, 'user3');
            
            expect(mockGetWaves).toBeCalledWith('/api/1.0/users/user3/waves/5?direction=after&count=true');
        });
    });

    describe('postWaveFile', () => {

        it ('calls /api/1.0/waves/upload', () => {
            const mockPostWaveFile = jest.fn();
            axios.post = mockPostWaveFile;
            
            apiCalls.postWaveFile();
            const path = mockPostWaveFile.mock.calls[0][0];
            
            expect(path).toBe('/api/1.0/waves/upload');
        });
    });

    describe('deleteWave', () => {

        it ('calls /api/1.0/waves/5 when wave id param procided as 5', () => {
            const mockDelete = jest.fn();
            axios.delete = mockDelete;
            
            apiCalls.deleteWave(5);
            const path = mockDelete.mock.calls[0][0];
            
            expect(path).toBe('/api/1.0/waves/5');
        });
    })

});