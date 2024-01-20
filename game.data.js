export const OFFER_STATUSES = {
    default: 'default',
    miss: 'miss',
    caught: 'caught'
}


export const _data = {
    // array for cells: cell = {x,y}
    settings: {
        rowsCount: 5,
        columnsCount: 4,
        pointsToWin: 10,
        maximumMisses: 3,
        decreaseDeltaInMs: 100,
        isMuted: true,
    },
    offerStatus: OFFER_STATUSES.default,
    coords: {
        offer: {
            current: {
                x: 1,
                y: 0,
            },
            previous: {
                x: 1,
                y: 2,
            },
        },
        player1: {
            current: {
                x: 2,
                y: 2,
            },
        },
        player2: {
            current: {
                x: 2,
                y: 2,
            },
        },
    },
    score: {
        missCount: 0,
        player1: 0,
        player2: 0,
    },
};

let _subscribers = []

function _notify(command) {
    _subscribers.forEach(subscriber => subscriber(command))
}


let _stepIntervalId;

export function _runStepInterval() {
    _stepIntervalId = setInterval(() => {
        _missOffer();
        _moveOfferToRandomPosition(true);
        _notify({
            type: "missOffer",
            payload: {
                x: _data.coords.offer.current.x,
                y: _data.coords.offer.current.y,
                score: _data.score,
            }
        });
    }, 2000);
}


function _moveOfferToRandomPosition() {
    let newX = null;
    let newY = null;

    do {
        newX = _getRandom(_data.settings.columnsCount - 1);
        newY = _getRandom(_data.settings.rowsCount - 1);

        var offerIsOnNewCoords = _data.coords.offer.current.x === newX && _data.coords.offer.current.y === newY;
        var playerIsOnNewCoords = (_data.coords.player1.current.x === newX && _data.coords.player1.current.y === newY) || (_data.coords.player2.current.x === newX && _data.coords.player2.current.y === newY);
    } while (
        offerIsOnNewCoords || playerIsOnNewCoords)

    moveOfferToPosition(newX, newY);
}


export function moveOfferToPosition(newX, newY) {
    _data.coords.offer.current.x = newX;
    _data.coords.offer.current.y = newY;
    _notify({type: "unknown"});
}

function _missOffer() {
    _data.offerStatus = OFFER_STATUSES.miss;
    _data.score.missCount++;

    _data.coords.offer.previous = {
        ..._data.coords.offer.current
    };
    setTimeout(() => {
        _data.offerStatus = OFFER_STATUSES.default;
    }, 200);
}

function _getRandom(N) {
    return Math.floor(Math.random() * (N + 1));
}


// setter
function catchOffer(player) {
    _data.offerStatus = OFFER_STATUSES.caught;
    _data.score[player]++;
    _data.coords.offer.previous = {
        ..._data.coords.offer.current
    };
    setTimeout(() => {
        _data.offerStatus = OFFER_STATUSES.default;
        _notify({type: 'unknown'});
    }, 200);

    _moveOfferToRandomPosition();
    _notify({
        type: "catchOffer", payload: {
            player: player,
            score: _data.score,
            x: _data.coords[player].current.x,
            y: _data.coords[player].current.y,
        }
    })
    clearInterval(_stepIntervalId);
    _runStepInterval();
}

export function subscribe(newSubscriber) {
    _subscribers.push(newSubscriber);
}

export function movePlayer1Up(role) {
    _data.coords[role].current.y--;
    checkCatching();
    _notify({type: "movePlayer1Up", payload: {role: role}});
}

export function movePlayer1Down(role) {
    _data.coords[role].current.y++;
    checkCatching();
    _notify({type: "movePlayer1Down", payload: {role: role}});
}

export function movePlayer1Left(role) {
    _data.coords[role].current.x--;
    checkCatching();
    _notify({type: "movePlayer1Left", payload: {role: role}});
}

export function movePlayer1Right(role) {
    _data.coords[role].current.x++;
    checkCatching();
    _notify({type: "movePlayer1Right", payload: {role: role}});
}

function checkCatching() {
    if (_data.coords.player1.current.x === _data.coords.offer.current.x
        && _data.coords.player1.current.y === _data.coords.offer.current.y) {
        catchOffer('player1');

    } else if (_data.coords.player2.current.x === _data.coords.offer.current.x
        && _data.coords.player2.current.y === _data.coords.offer.current.y) {
        catchOffer('player2');
    }
}


// SELECTORS

// getter
export function selectCurrentOfferCoords() {
    return _data.coords.offer.current;
}

export function selectPreviousOfferCoords() {
    return _data.coords.offer.previous;
}

export function selectOfferStatus() {
    return _data.offerStatus;
}

export function selectPlayer1Coords() {
    return _data.coords.player1.current;
}

// ui - bll - dal
// solid, grasp, ddd
// чистая архитектура
// архитектура портов и адаптеров
// Мартин Фаулер, Рефакторинг