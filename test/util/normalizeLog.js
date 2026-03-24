/**
 * Normalizes log paths replacing absolute paths.
 *
 * @param {string|string[]}   input - Log statement.
 *
 * @returns {string|string[]} Normalized log statement.
 */
export function normalizeLog(input)
{
   if (typeof input === 'string')
   {
      // Normalize Windows backslashes.
      // Strip absolute path prefix up to test fixture root.
      return input
         .replace(/\\/g, '/')
         .replace(/'[^']*?\.?\/?test\/fixture\//g, "'<ROOT>/test/fixture/");
   }
   else if (Array.isArray(input))
   {
      const result = [];

      for (const entry of input)
      {
         // Normalize Windows backslashes.
         // Strip absolute path prefix up to test fixture root.
         const norm = entry
            .replace(/\\/g, '/')
            .replace(/'[^']*?\.?\/?test\/fixture\//g, "'<ROOT>/test/fixture/");

         result.push(norm);
      }

      return result;
   }

   throw new Error(`'input' is not a string or string[].`);
}
