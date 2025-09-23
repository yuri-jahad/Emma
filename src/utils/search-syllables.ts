import { list } from "../data/initialize-dico"
import { shuffle } from "./search-words"

const occurrences = list?.data.occurrences

export const getSoluces = async (
  occurrenceCount: string
): Promise<GetSolucesReturn> => {
  const parsedOccurrenceCount = parseInt(occurrenceCount)

  if (isNaN(parsedOccurrenceCount)) {
    return {
      status: 'failed',
      message: "Le paramètre que vous avez choisi n'est pas un nombre."
    }
  }
  const syllables: string[] = []

  for (const syllable in occurrences) {
    if (occurrences[syllable] == parsedOccurrenceCount) {
      syllables.push(syllable.toUpperCase())
    }
  }

  shuffle(syllables)

  console.log(
    Object.keys(syllables).map(
      element => occurrences[element] == parsedOccurrenceCount
    ).length
  )

  const message =
    syllables.length > 0
      ? `(${syllables.length})\n${syllables.slice(0, 200).join(' ')}.`
      : `Aucune syllabe n'a été trouvée.`

  return { status: 'success', message }
}
