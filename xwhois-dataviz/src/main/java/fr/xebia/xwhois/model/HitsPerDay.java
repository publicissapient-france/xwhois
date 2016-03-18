package fr.xebia.xwhois.model;

import fr.xebia.xwhois.model.inbound.Answers;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.TreeMap;

import static java.util.Arrays.asList;
import static java.util.stream.Collectors.*;

public class HitsPerDay {

    private Map<LocalDate, Integer> hitsPerDay;

    public HitsPerDay(Answers answers) {
        hitsPerDay = new TreeMap<>();
        hitsPerDay.putAll(answers.get().stream().collect(groupingBy(
            answer -> answer.getDate().atZone(ZoneId.systemDefault()).toLocalDate(),
            reducing(0, a -> 1, Integer::sum)
        )));
    }

    HitsPerDay(Answer... answers) {
        this(() -> asList(answers));
    }

    public Map<LocalDate, Integer> value() {
        return hitsPerDay;
    }

    public String json() {
        return value().entrySet().stream()
            .map(entry -> "[" + entry.getKey().atStartOfDay().toEpochSecond(ZoneOffset.UTC) * 1000 + ", " + entry.getValue() + "]")
            .collect(joining(",\n", "[\n", "\n]"));
    }
}
