import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()

  const registry = await ethers.getContract('ENSRegistry', owner)
  const nameWrapper = await ethers.getContract('NameWrapper', owner)
  const controller = await ethers.getContract('EDXRegistrarController', owner)
  const reverseRegistrar = await ethers.getContract('ReverseRegistrar', owner)

  const deployArgs = {
    from: deployer,
    
    args: [
      registry.address,
      nameWrapper.address,
      controller.address,
      reverseRegistrar.address,
    ],
    log: true,
  }
  const publicResolver = await deploy('PublicResolver', deployArgs)
  if (!publicResolver.newlyDeployed) return

  const tx = await reverseRegistrar.setDefaultResolver(publicResolver.address)
  console.log(
    `Setting default resolver on ReverseRegistrar to PublicResolver (tx: ${tx.hash})...`,
  )
  await tx.wait()

  if ((await registry.owner(ethers.utils.namehash('resolver.edx'))) === owner) {
    const pr = (await ethers.getContract('PublicResolver')).connect(
      await ethers.getSigner(owner),
    )
    const resolverHash = ethers.utils.namehash('resolver.edx')
    const tx2 = await registry.setResolver(resolverHash, pr.address)
    console.log(
      `Setting resolver for resolver.edx to PublicResolver (tx: ${tx2.hash})...`,
    )
    await tx2.wait()

    const tx3 = await pr['setAddr(bytes32,address)'](resolverHash, pr.address)
    console.log(
      `Setting address for resolver.edx to PublicResolver (tx: ${tx3.hash})...`,
    )
    await tx3.wait()
  } else {
    console.log(
      'resolver.edx is not owned by the owner address, not setting resolver',
    )
  }
}

func.id = 'resolver'
func.tags = ['resolvers', 'PublicResolver']
func.dependencies = [
  'registry',
  'EDXRegistrarController',
  'NameWrapper',
  'ReverseRegistrar',
]

export default func
