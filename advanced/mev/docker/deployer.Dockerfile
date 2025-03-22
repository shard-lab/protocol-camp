FROM ghcr.io/foundry-rs/foundry:latest

WORKDIR /app
RUN forge init
COPY ./foundry/Mev.sol /app/src/Mev.sol
COPY ./foundry/DeployMev.s.sol /app/script/DeployMev.s.sol
COPY ./foundry/foundry.toml /app/foundry.toml
RUN forge build
ENTRYPOINT ["sh", "-c", "forge script script/DeployMev.s.sol --rpc-url $ANVIL_URL --broadcast && cp addresses.json /shared/"]