import * as React from 'react';

const useStorageState = (key, initialState) => {
    const [value, setValue] = React.useState(localStorage.getItem(key) || initialState);

    React.useEffect(() => {
        localStorage.setItem(key, value);
    }, [value, key]);

    return [value, setValue];
};

const initialStories = [
    {
        title: 'React',
        url: 'https://reactjs.org/',
        author: 'Jordan Walke',
        num_comments: 3,
        points: 4,
        objectID: 0
    }, {
        title: 'Redux',
        url: 'https://redux.js.org/',
        author: 'Dan Abramov, Andrew Clark',
        num_comments: 2,
        points: 5,
        objectID: 1
    },
];

const getAsyncStories = () => new Promise(
    (resolve) => 
        setTimeout(() => 
            resolve({ data: { stories: initialStories } }), 2000)
    );

const storiesReducer = (state, action) => {
    switch(action.type) {
        case 'STORIES_FETCH_INIT':
            return {
                ...state,
                isLoading: true,
                isError: false,
            };
        case 'STORIES_FETCH_SUCCESS':
            return {
                ...state,
                data: action.payload,
                isLoading: false,
                isError: false,
            };
        case 'STORIES_FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true
            };
        case 'REMOVE_STORY':
            return {
                ...state,
                data : state.data.filter((story) => action.payload.objectID != story.objectID)
            };
        default:
            throw new Error();
    }
};

const App = () => {
    const [searchTerm, setSearchTerm] = useStorageState('search', ''); 
    const [stories, dispatchStories] = React.useReducer(storiesReducer, {data: [], isLoading : false, IsError: false});

    React.useEffect(() => {
        dispatchStories({type: "STORIES_FETCH_INIT"});

        getAsyncStories().then((result) => {
            dispatchStories({
                type : 'STORIES_FETCH_SUCCESS',
                payload: result.data.stories,
            });
        }).catch(() => dispatchStories({type : "STORIES_FETCH_FAILURE"}));
    }, []);

    const handleRemoveStory = (item) => {
        dispatchStories({
            type :"REMOVE_STORY",
            payload: item,
        });
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };
    

    const searchedStories = stories.data.filter((story) => story.title.toLowerCase().includes(searchTerm.toLowerCase()));
        
    return (
        <div>
            <h1>My Hacker Stories</h1>
            <InputWithLabel id="search" label="Search" value={searchTerm} onInputChange={handleSearch}/>
            <hr/>
            {stories.isLoading ? <p>Loading...</p> : <List list={stories.data} searchTerm={searchTerm} onRemoveItem={handleRemoveStory}/>}
        </div>
    );
}


const List = ({list, onRemoveItem}) => ( 
    <ul> {list.map((item) => <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem}/>)} </ul>
);

const Item = ({item, onRemoveItem})  => {
    return (
    <li>
        <span>
            <a href={item.url}>{item.title}</a>
        </span>
        <span>{item.author}</span>
        <span>{item.num_comments}</span>
        <span>{item.points}</span>
        <span>
            <button type="button" onClick={() => onRemoveItem(item)}>Dismiss</button>
        </span>
    </li>
    );
}

const InputWithLabel = ({id, label, value, type = "text", onInputChange}) => (
    <>
        <label htmlFor={id}>{label}: </label>
        <input id={id} type={type} value={value} onChange={onInputChange}></input>
        <p>Searching for <strong>{value}.</strong></p>
    </>
);

export default App;
