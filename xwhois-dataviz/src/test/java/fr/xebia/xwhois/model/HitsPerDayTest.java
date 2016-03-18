package fr.xebia.xwhois.model;

import org.junit.Test;

import java.time.Instant;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.entry;

public class HitsPerDayTest {

    @Test
    public void should_compute_hits_per_day() {
        assertThat(new HitsPerDay(
                new Answer("toto", "Ab CDE", false, Instant.parse("2016-02-23T19:12:52.067Z")),
                new Answer("toto", "Fg HIJ", true, Instant.parse("2016-02-23T19:12:54.249Z")),
                new Answer("toto", "Kl MNO", true, Instant.parse("2016-03-07T10:49:51.880Z")),
                new Answer("toto", "Pq RST", true, Instant.parse("2016-03-07T10:49:57.534Z")),
                new Answer("toto", "Uv WXY", true, Instant.parse("2016-03-07T10:51:11.936Z")),
                new Answer("toto", "Za bcd", true, Instant.parse("2016-03-07T10:51:17.480Z"))
        ).value()).containsExactly(
                entry(LocalDate.parse("2016-02-23"), 2),
                entry(LocalDate.parse("2016-03-07"), 4)
        );
    }

    @Test
    public void should_compute_hits_per_day_json() {
        assertThat(new HitsPerDay(
                new Answer("toto", "Ab CDE", false, Instant.parse("2016-02-23T19:12:52.067Z")),
                new Answer("toto", "Fg HIJ", true, Instant.parse("2016-02-23T19:12:54.249Z")),
                new Answer("toto", "Kl MNO", true, Instant.parse("2016-03-07T10:49:51.880Z")),
                new Answer("toto", "Pq RST", true, Instant.parse("2016-03-07T10:49:57.534Z")),
                new Answer("toto", "Uv WXY", true, Instant.parse("2016-03-07T10:51:11.936Z")),
                new Answer("toto", "Za bcd", true, Instant.parse("2016-03-07T10:51:17.480Z"))
        ).json()).isEqualTo("" +
                "[\n" +
                "[1456185600000, 2],\n" +
                "[1457308800000, 4]\n" +
                "]");
    }

}
