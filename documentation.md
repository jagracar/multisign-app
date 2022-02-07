# Documentation


## Background

As soon as the the Teia community was formed, just one day after the hic et nunc main site
discontinuation, it became clear that decisions would need to be taken in a distributed manner
and that a single person should not have the power to shut down a site, modify the internal
parameters of a critical smart contract or administer the platform fees.

Using a multisig was proposed as a quick solution to manage the future Teia marketplace fees 
before a community DAO was created. A multisig is a smart contract that requires several signatures in 
order to execute transactions.

After some investigations, it was found that existing tezos solutions were not easy to use for
the average artists / collector. This lead to the decision of creating a basic multisig smart
contract that would be easy to use and could incorporate some special features needed by the
Teia community.

These were the main requirements for the Teia multisig:

 - Easy to use web interface vs. the console mode from previously existing solutions.
 - It should be possible to add and remove users to allow responsibility rotation.
 - It should be possible to modify the required quorum to execute transactions.
 - In addition to tez transactions, the multisig should be able to call other smart contracts.
   In particular, it should be able to administer the Teia marketplace contract (update the fees,
   include new tokens to trade on the site, pause the swaps and collects).
 - User actions should be registered for future evaluation and archival purposes.

Based on these requirements, a group of members of the Teia community started to develop a new
multisig smart contract in the last days of November 2021. Few days later a prototype was deployed
to the tezos testnet and it was tested by several community members. 

After many iterations, on Decemeber 20th 2021, a final version of the multisig smart contract
code and unit tests was sent to inference_ag to perform an security audit of the code.

The audit didn't find any major security issues, but suggested documentation improvements
and some code changes to save in user transaction costs. Changes were implemented and the final
version of the Teia multisig was deployed to the tezos mainnet on the 31st of January 2022.

At the same time that the audit was done, a basic web interface was developed to simplify the
use of the multisig. After syncing their wallet, a user of the multisig could create proposals
to be voted by other multisig users, can vote other user proposals, and can execute any proposal
that has reached the required number of positive votes to be approved.


## General use case

As described before, the initial purpose of the Teia multisig contract was to facility the
managing of the Teia marketplace contract and fees. However, the multisig is general enough
to be used in many other situations:

 - A NGO could create a multisig to administer third party donations in a safe way.
 - A group of collectors could create a multisig to buy and sell NFTs.
 - A group of friends could use a multisig to decide their next holiday destination.

Before creating (originating) a multisig, one needs to decide the following:

 - How many users will be part of the multisig? A user is identified by their tz wallet.
   In principle, there is no upper limit in the number of users the multisig can have, but the
   smart contract code is not designed to work with several thousand of users. Less than 50
   users is recommended.
 - How many positive votes are required to approve proposals. This number should be higher
   than 1, but not higher than the number of users. The higher the number, the more difficult
   will be to approve a proposal.
 - The proposal expiration time expressed in days after the proposal creation. If the time is 
   too short, proposals might not get approved, because some users might not have enough time
   to vote for them.

## Multisig web interface

Once the multisig is deployed to the mainnet, users can interact with it using the web interface.
The first step is to sync their wallets, to prove that they are a member of the multisig.

The starting page displays the main multisig parameters: 

 - the list of multisig users
 - the multisig contract address
 - the minimum number of positive votes required to execute proposals
 - the proposals expiration time
 - the current multisig tez balance

Any wallet can transfer tez to the multisig. It is not necessary that the wallet is a multisig
user. This allows third party donations and tez transfers from other contracts (e.g. fee transfers
from the Teia marketplace contract).

One can use the any tezos wallet (Temple, Kukai) to transfer tez or NFTs to the multisig.
Just use the multisig contract address as the receiver address.

Clicking on the proposals tab we can access the information of all current and past proposals.
They are distributed in tree groups: active, executed and expired proposals.

Active proposals are those that have not yet being executed and their expiration time has not yet
passed. These are the only proposals that users of the multisig can interact with. Any user
will see YES / NO buttons that they can click to vote. Close to those buttons
there is a counter with the number of positive votes that the proposal has received so far. If the
user has not voted yet the proposal, the background color will be white. If they already
voted YES, the background color will be green, and if they voted NO it will be red. Users can
change their vote at any moment by clicking again on the YES / NO buttons.

Note that only positive votes (YES votes) are counted to decide if a proposal can be executed or
not. Negative votes have no effect, except to highlight the user disagreement with the proposal.
All votes are stored inside the smart contract and can always be inspected to see how controversial
a proposal was.

When an active proposal reaches the minimum number of positive votes, a new EXECUTE button appears.
This button can be clicked by any multisig user and will result in the execution of the proposal.

Once a proposal is executed, it cannot be voted or executed anymore. It leaves the active proposal
list and becomes part of the executed proposal list. In that list one can see which proposals have
been executed and the number of positive votes that they received.

Finally, the last proposal list shows those proposals that didn't reach the minimum number of votes
to be executed before their expiration time. After the expiration time, these proposals cannot 
be voted anymore. They are listed to see proposals that did not reach an agreement between the
multisig users.

Note that one can always resubmit an expired proposal and start the voting process again.

Each proposal can be identified by an unique id number. Ideally, before the voting process starts, 
proposals should be discussed between the multisig users via discord / twitter / email. The
proposal id should be used in the discussion to keep the connection with the voting in the multisig.

## Creating proposals

Multisig users can create new proposals at any time. To do it, they need to go to the create proposal
tab. This page contains a list of forms that can be used to submit new proposals.

These are the different proposals that the multisig supports:

- Transfer tez proposal. Use this proposal to transfer tez from the multisig to list of addresses.
  Each address can receive a different tez amount. Of course, the total tez amount should be smaller
  than the number of tez in the multisig at the time of execution.

- Transfer token proposal. With this proposal one can transfer editions of FA2 token owned by the multisig
  to a list of addresses. Each address can receive a different number of token editions.

- Text proposals. This proposal is used to approve a text that has no direct consequence on the
  multisig or any other smart contract. They are used to register the users support to a given proposal
  written in plain text and stored in IPFS. For example, a text proposal could ask to change some
  component on a website UI, decide on a dog name, or suggest that one multisig user buys bread at the
  bakery.

- Lambda function proposal. This is the most powerful of all proposals and at the same time the most
  complex and the one that requires more close inspection. The proposal consists on some Michelson code
  that will be executed once the proposal is approved. This proposal could be used to collect or swap NFTs,
  to update other contract parameters, to delegate the multisig tez to a baker or to vote in a DAO of
  which the multisig is a member. Since the proposal consist of pure Michelson code, it's important that users
  understand what the code is doing before voting YES to it.

- Add user proposal. One can use this proposal to add new users to the multisig.

- Remove user proposal. Same as the add user proposal, but to remove an existing user from the multisig.

- Minimum votes proposal. With this proposal one can increase or decrease the minimum of positive votes
  required to execute a proposal.
  
- Expiration time proposal. Use this proposal to change the proposals expiration time.


## Important considerations

- Choose well the number of users and the minimum votes to approve proposals. Imagine a multisig with only
  2 users where only one positive vote is needed to execute proposals. In that situation, one of the users
  could create a proposal to transfer all the tez to an account controlled by the user. On the other side,
  a multisig with two users an a minimum of 2 positive votes to execute proposals could get blocked if
  one of the users disappears or losses their wallet keys. In that case, it would be impossible to execute
  proposals and any tez or tokens in the multisig will become inaccessible.
  
  These kind of situations could be minimized adding more users to the multisig. A multisig with 9 users
  and a minimum of 5 positive votes to approve proposals, would make more difficult that a small group
  of users impose their proposals to the rest. At the same time, 4 user would need to loose their keys
  to block the multisig forever.
  
  Ideally inactive multisig users should be identified and removed from the multisig to avoid the problem
  of not being able to approve proposals.
  
- Any update in the multisig parameters will affect all active and expired proposals. One should always
  evaluate the unexpected consequences that changing the parameter could have on them.

  For example, reducing the expiration time from 5 to 2 days could set some active proposals as expired.
  Increasing it from 5 to 10 days could reactivate some expired proposals.
  
  Removing a user might make a multisig inoperable if the minimum number of positive votes is not reduced
  at the same time and there are a significant fraction of inactive users in the multisig. For example,
  a multisig with 4 users and 3 minimum positive votes to approve proposal, will become a 3 users multisig
  if one of the users is removed and will require that all vote yes to approve future proposals. If one
  of the users is not active, the multisig will be blocked.
  
  Increasing the number of positive votes to approve proposals could also block a multisig if many users
  are not active or loose their keys.

