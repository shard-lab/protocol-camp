FROM ghcr.io/foundry-rs/foundry:latest

WORKDIR /app
RUN forge init
COPY ./foundry/NthCallerGame.sol /app/src/NthCallerGame.sol
COPY ./foundry/Deploy.s.sol /app/script/Deploy.s.sol
COPY ./foundry/foundry.toml /app/foundry.toml
RUN forge build
ENTRYPOINT ["sh", "-c", "forge script script/Deploy.s.sol --rpc-url $ANVIL_URL --broadcast && cp addresses.json /shared/"]