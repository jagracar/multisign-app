import React from 'react';


export function Users() {
    // Define the users information
    const users = [
        {id: '0', name: 'user1', wallet: 'tz11'},
        {id: '1', name: 'user2', wallet: 'tz12'},
        {id: '2', name: 'user3', wallet: 'tz13'},
        {id: '3', name: 'user4', wallet: 'tz14'}
    ];

    // Build the user items
    const userItems = users.map((user) => (
        <li key={user.id}>
            <a href={'https://tzkt.io/' + user.wallet}>
                {user.name}
            </a>
        </li>
    ));

    return (
        <div>
            <h3>Users</h3>
            <ul>
                {userItems}
            </ul>
        </div>
    );
}
